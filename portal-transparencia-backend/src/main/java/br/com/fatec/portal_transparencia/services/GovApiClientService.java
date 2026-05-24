package br.com.fatec.portal_transparencia.services;

import br.com.fatec.portal_transparencia.dtos.ApiResponse;
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
import org.springframework.web.client.RestClientResponseException;
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

    /**
     * Consulta despesas no Portal da Transparência, formata os dados e salva no banco local.
     * Retorna um ApiResponse contendo a quantidade de registros que foram gravados.
     */
    public ApiResponse<Integer> sincronizarDespesasGoverno(Integer ano, Integer pagina, String estado, String codigoOrgao) {
        
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(15000); 
        factory.setReadTimeout(30000);   
        
        RestTemplate restTemplate = new RestTemplate(factory);

        HttpHeaders headers = new HttpHeaders();
        headers.set("chave-api-dados", apiChave);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            String urlCompleta = apiUrl + "/despesas/por-orgao?ano=" + ano + "&orgao=" + codigoOrgao + "&pagina=" + pagina;
            
            ResponseEntity<GovDespesaDTO[]> response = restTemplate.exchange(
                    urlCompleta,
                    HttpMethod.GET, 
                    entity, 
                    GovDespesaDTO[].class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<GovDespesaDTO> despesasRetornadas = Arrays.asList(response.getBody());
                
                Long idCategoria = 3L; // Assistência Social
                if ("26000".equals(codigoOrgao)) idCategoria = 1L; // Educação
                if ("36000".equals(codigoOrgao)) idCategoria = 2L; // Saúde

                CategoriaTematica categoriaSelecionada = categoriaRepository.findById(idCategoria).orElseThrow();
                FonteDados fontePadrao = fonteRepository.findById(1L).orElseThrow();

                int registrosSalvos = 0;

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
                        registrosSalvos++;
                    }
                }
                
                return new ApiResponse<>(true, "Sincronização concluída com sucesso.", registrosSalvos);
            }
            
            return new ApiResponse<>(false, "Nenhum dado foi retornado pela API do Governo.", 0);
            
        } catch (RestClientResponseException e) {
            System.err.println("Falha HTTP na sincronização: " + e.getResponseBodyAsString());
            return new ApiResponse<>(false, "Erro de comunicação com o Governo: Status " + e.getStatusCode().value(), 0);
            
        } catch (Exception e) {
            System.err.println("Erro interno na sincronização: " + e.getMessage());
            return new ApiResponse<>(false, "Falha interna no sistema ao processar os dados.", 0);
        }
    }
}