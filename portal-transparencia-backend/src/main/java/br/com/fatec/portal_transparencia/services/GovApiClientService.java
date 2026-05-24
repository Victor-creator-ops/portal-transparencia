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

    public String sincronizarDespesasGoverno(Integer ano, Integer pagina, String estado) {
        
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000); // Se não conectar em 5 segundos, aborta
        factory.setReadTimeout(10000);   // Se conectar mas demorar 10s para enviar os dados, aborta
        
        RestTemplate restTemplate = new RestTemplate(factory);

        HttpHeaders headers = new HttpHeaders();
        headers.set("chave-api-dados", apiChave);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<GovDespesaDTO[]> response = restTemplate.exchange(
                    apiUrl + "/despesas/por-orgao?ano=" + ano + "&orgao=26000&pagina=" + pagina,
                    HttpMethod.GET,
                    entity,
                    GovDespesaDTO[].class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<GovDespesaDTO> despesasRetornadas = Arrays.asList(response.getBody());
                
                CategoriaTematica categoriaPadrao = categoriaRepository.findById(1L).orElseThrow();
                FonteDados fontePadrao = fonteRepository.findById(1L).orElseThrow();

                for (GovDespesaDTO dto : despesasRetornadas) {
                    if (dto.getAno() != null && dto.getLiquidado() != null) {
                        GastoSocial gasto = new GastoSocial();
                        
                        gasto.setAnoExercicio(dto.getAno());
                        gasto.setMesReferencia(12); 
                        
                        String valorLimpo = dto.getLiquidado().replace(".", "").replace(",", ".");
                        gasto.setValorGasto(new java.math.BigDecimal(valorLimpo));
                        
                        gasto.setCategoriaTematica(categoriaPadrao);
                        gasto.setFonteDados(fontePadrao);
                        gasto.setEstadoUf(estado); 
                        
                        gastoRepository.save(gasto);
                    }
                }
                return "Sincronização concluída! " + despesasRetornadas.size() + " registros (" + estado + ") baixados.";
            }

        } catch (Exception e) {
            System.err.println("Erro na comunicação com a API do Governo: " + e.getMessage());
            return "Falha ao consultar servidores: " + e.getMessage();
        }

        return "Nenhum dado retornado para os parâmetros informados.";
    }
}