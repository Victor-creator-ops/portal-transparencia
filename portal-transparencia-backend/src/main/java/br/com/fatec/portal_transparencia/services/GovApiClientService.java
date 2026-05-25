package br.com.fatec.portal_transparencia.services;

import br.com.fatec.portal_transparencia.dtos.ApiResponse;
import br.com.fatec.portal_transparencia.dtos.GovDespesaDTO;
import br.com.fatec.portal_transparencia.models.CategoriaTematica;
import br.com.fatec.portal_transparencia.models.FonteDados;
import br.com.fatec.portal_transparencia.models.GastoSocial;
import br.com.fatec.portal_transparencia.models.Licitacao;
import br.com.fatec.portal_transparencia.repositories.CategoriaTematicaRepository;
import br.com.fatec.portal_transparencia.repositories.FonteDadosRepository;
import br.com.fatec.portal_transparencia.repositories.GastoSocialRepository;
import br.com.fatec.portal_transparencia.repositories.LicitacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@SuppressWarnings("unchecked")
public class GovApiClientService {

    @Value("${gov.api.transparencia.url}")
    private String apiUrl;

    @Value("${gov.api.transparencia.chave}")
    private String apiChave;

    @Autowired
    private GastoSocialRepository gastoRepository;

    @Autowired
    private CategoriaTematicaRepository categoriaRepository;

    @Autowired
    private FonteDadosRepository fonteRepository;

    @Autowired
    private LicitacaoRepository licitacaoRepository;

    // ==========================================
    // 1. SINCRONIZAÇÃO DE GASTOS SOCIAIS 
    // ==========================================
    public ApiResponse<Object> sincronizarDespesasGoverno(Integer ano, Integer pagina, String estado, String codigoOrgao) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(15000); 
        factory.setReadTimeout(30000);   
        RestTemplate restTemplate = new RestTemplate(factory);

        HttpHeaders headers = new HttpHeaders();
        headers.set("chave-api-dados", apiChave);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("User-Agent", "Mozilla/5.0");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<GovDespesaDTO[]> response = restTemplate.exchange(
                    apiUrl + "/despesas/por-orgao?ano=" + ano + "&orgao=" + codigoOrgao + "&pagina=" + pagina,
                    HttpMethod.GET, entity, GovDespesaDTO[].class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<GovDespesaDTO> despesasRetornadas = Arrays.asList(response.getBody());
                Long idCategoria = 3L; 
                if ("20000".equals(codigoOrgao)) idCategoria = 1L; 
                if ("22000".equals(codigoOrgao)) idCategoria = 2L; 
                if ("24000".equals(codigoOrgao)) idCategoria = 3L;
                if ("26000".equals(codigoOrgao)) idCategoria = 4L;
                if ("30000".equals(codigoOrgao)) idCategoria = 5L;
                if ("36000".equals(codigoOrgao)) idCategoria = 6L;
                if ("39000".equals(codigoOrgao)) idCategoria = 7L;
                if ("52000".equals(codigoOrgao)) idCategoria = 8L;

                CategoriaTematica categoriaSelecionada = categoriaRepository.findById(idCategoria).orElseThrow();
                FonteDados fontePadrao = fonteRepository.findById(1L).orElseThrow();

                int registrosSalvos = 0, registrosIgnorados = 0;

                for (GovDespesaDTO dto : despesasRetornadas) {
                    if (dto.getAno() != null && dto.getLiquidado() != null) {
                        String valorLimpo = dto.getLiquidado().replace(".", "").replace(",", ".");
                        BigDecimal valorBigDecimal = new BigDecimal(valorLimpo);

                        if (!gastoRepository.existsByAnoExercicioAndEstadoUfAndValorGasto(dto.getAno(), estado, valorBigDecimal)) {
                            GastoSocial gasto = new GastoSocial();
                            gasto.setAnoExercicio(dto.getAno());
                            gasto.setValorGasto(valorBigDecimal);
                            gasto.setCategoriaTematica(categoriaSelecionada);
                            gasto.setFonteDados(fontePadrao);
                            gasto.setEstadoUf(estado); 
                            gastoRepository.save(gasto);
                            registrosSalvos++;
                        } else { registrosIgnorados++; }
                    }
                }
                return new ApiResponse<>(true, "Sincronização: " + registrosSalvos + " salvos, " + registrosIgnorados + " ignorados (já existiam).", null);
            }
        } catch (Exception e) {
            return new ApiResponse<>(false, "Falha ao consultar o Portal da Transparência: " + e.getMessage(), null);
        }
        return new ApiResponse<>(false, "Nenhum dado retornado.", null);
    }

    // ==========================================
    // 2. SINCRONIZAÇÃO DE LICITAÇÕES (BLINDADA)
    // ==========================================
    public ApiResponse<Object> sincronizarLicitacoesGoverno(String dataInicial, String dataFinal, String codigoOrgao) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(15000); 
        factory.setReadTimeout(40000); 
        RestTemplate restTemplate = new RestTemplate(factory);

        HttpHeaders headers = new HttpHeaders();
        headers.set("chave-api-dados", apiChave);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("User-Agent", "Mozilla/5.0");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        String url = apiUrl + "/licitacoes?dataInicial=" + dataInicial + "&dataFinal=" + dataFinal + "&codigoOrgao=" + codigoOrgao + "&pagina=1";

        try {
            ResponseEntity<Map[]> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map[].class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                int salvos = 0, ignorados = 0;
                FonteDados fontePadrao = fonteRepository.findById(1L).orElse(null);
                Integer ano = Integer.parseInt(dataInicial.substring(6)); 

                for (Map<String, Object> item : response.getBody()) {
                    try {
                        // 1. Blindagem do Objeto Licitação
                        Map<String, Object> licitacaoNode = item;
                        if (item.get("licitacao") instanceof Map) {
                            licitacaoNode = (Map<String, Object>) item.get("licitacao");
                        }

                        String numero = licitacaoNode.containsKey("numero") ? String.valueOf(licitacaoNode.get("numero")) : "S/N";
                        String objeto = licitacaoNode.containsKey("objeto") ? String.valueOf(licitacaoNode.get("objeto")) : "Objeto não informado";
                        
                        // 2. Blindagem do Órgão (Trata como Objeto ou String)
                        String orgaoNome = codigoOrgao;
                        Object orgaoGov = item.get("orgao");
                        if (orgaoGov instanceof Map) {
                            Map<String, Object> orgaoMap = (Map<String, Object>) orgaoGov;
                            if (orgaoMap.containsKey("nome")) orgaoNome = String.valueOf(orgaoMap.get("nome"));
                        } else if (orgaoGov instanceof String) {
                            orgaoNome = (String) orgaoGov;
                        }

                        // 3. Blindagem do Valor
                        BigDecimal valor = BigDecimal.ZERO;
                        if (item.containsKey("valor")) {
                            try { valor = new BigDecimal(String.valueOf(item.get("valor"))); } catch(Exception e) {}
                        }

                        // 4. Blindagem da Situação / Modalidade (Procura em vários campos)
                        String situacao = "Homologada"; 
                        Object modGov = item.get("modalidadeLicitacao");
                        Object sitGov = item.get("situacaoCompra");

                        if (sitGov instanceof String) {
                            situacao = (String) sitGov;
                        } else if (modGov instanceof Map) {
                            Map<String, Object> modMap = (Map<String, Object>) modGov;
                            if (modMap.containsKey("descricao")) situacao = String.valueOf(modMap.get("descricao"));
                        } else if (modGov instanceof String) {
                            situacao = (String) modGov;
                        }

                        // Salva se não for duplicado
                        if (!licitacaoRepository.existsByNumeroAndAnoAndOrgao(numero, ano, orgaoNome)) {
                            Licitacao lic = new Licitacao();
                            lic.setNumero(numero);
                            lic.setAno(ano);
                            lic.setOrgao(orgaoNome);
                            lic.setObjeto(objeto);
                            lic.setValor(valor);
                            lic.setSituacao(situacao);
                            lic.setFonteDados(fontePadrao);
                            licitacaoRepository.save(lic);
                            salvos++;
                        } else {
                            ignorados++;
                        }
                    } catch (Exception e) {
                        System.err.println("Item ignorado por falha na estrutura do Governo: " + e.getMessage());
                    }
                }
                return new ApiResponse<>(true, "Foram buscadas no Governo e salvas " + salvos + " novas licitações (Ignoradas " + ignorados + " já existentes).", null);
            }
        } catch (Exception e) {
            return new ApiResponse<>(false, "Erro ao buscar Licitações no Governo: " + e.getMessage(), null);
        }
        return new ApiResponse<>(false, "Nenhuma licitação retornada para estes parâmetros.", null);
    }
}