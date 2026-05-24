package br.com.fatec.portal_transparencia.services;

import br.com.fatec.portal_transparencia.dtos.GovDespesaDTO;
import br.com.fatec.portal_transparencia.models.CategoriaTematica;
import br.com.fatec.portal_transparencia.models.FonteDados;
import br.com.fatec.portal_transparencia.models.GastoSocial;
import br.com.fatec.portal_transparencia.repositories.CategoriaTematicaRepository;
import br.com.fatec.portal_transparencia.repositories.FonteDadosRepository;
import br.com.fatec.portal_transparencia.repositories.GastoSocialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.util.Arrays;
import java.util.List;

@Service
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

    // Atualizado para receber o "codigoOrgao"
    public String sincronizarDespesasGoverno(Integer ano, Integer pagina, String estado, String codigoOrgao) {
        
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000); 
        factory.setReadTimeout(10000);   
        
        RestTemplate restTemplate = new RestTemplate(factory);

        HttpHeaders headers = new HttpHeaders();
        headers.set("chave-api-dados", apiChave);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            // 🔥 URL agora usa o código do órgão dinamicamente!
            ResponseEntity<GovDespesaDTO[]> response = restTemplate.exchange(
                    apiUrl + "/despesas/por-orgao?ano=" + ano + "&orgao=" + codigoOrgao + "&pagina=" + pagina,
                    HttpMethod.GET, entity, GovDespesaDTO[].class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<GovDespesaDTO> despesasRetornadas = Arrays.asList(response.getBody());
                
                // INTELIGÊNCIA: Define o ID da Categoria baseado no Órgão
                Long idCategoria = 3L; // Padrão: Assistência Social
                if ("26000".equals(codigoOrgao)) idCategoria = 1L; // Educação (MEC)
                if ("36000".equals(codigoOrgao)) idCategoria = 2L; // Saúde (MS)

                CategoriaTematica categoriaSelecionada = categoriaRepository.findById(idCategoria).orElseThrow();
                FonteDados fontePadrao = fonteRepository.findById(1L).orElseThrow();

                for (GovDespesaDTO dto : despesasRetornadas) {
                    if (dto.getAno() != null && dto.getLiquidado() != null) {
                        GastoSocial gasto = new GastoSocial();
                        gasto.setAnoExercicio(dto.getAno());
                        gasto.setMesReferencia(12); 
                        
                        String valorLimpo = dto.getLiquidado().replace(".", "").replace(",", ".");
                        gasto.setValorGasto(new java.math.BigDecimal(valorLimpo));
                        
                        gasto.setCategoriaTematica(categoriaSelecionada);
                        gasto.setFonteDados(fontePadrao);
                        gasto.setEstadoUf(estado); 
                        
                        gastoRepository.save(gasto);
                    }
                }
                return "Sincronização concluída! " + despesasRetornadas.size() + " registros baixados com sucesso.";
            }
        } catch (Exception e) {
            System.err.println("Erro na comunicação com a API do Governo: " + e.getMessage());
            return "Falha ao consultar servidores: " + e.getMessage();
        }
        return "Nenhum dado retornado para os parâmetros informados.";
    }
}