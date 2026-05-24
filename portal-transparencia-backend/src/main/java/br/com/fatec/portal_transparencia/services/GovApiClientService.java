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

    public String sincronizarDespesasGoverno(Integer ano, Integer pagina) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("chave-api-dados", apiChave);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        
        HttpEntity<String> entity = new HttpEntity<>(headers);

        // CORREÇÃO: Adicionado o filtro "&orgao=26000" (Ministério da Educação)
        String urlCompleta = apiUrl + "/despesas/por-orgao?ano=" + ano + "&orgao=26000&pagina=" + pagina;

        try {
            ResponseEntity<GovDespesaDTO[]> response = restTemplate.exchange(
                    urlCompleta,
                    HttpMethod.GET,
                    entity,
                    GovDespesaDTO[].class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<GovDespesaDTO> despesasRetornadas = Arrays.asList(response.getBody());
                
                // Pega a categoria "Educação" (Id 1) e a fonte "Portal da Transparência" (Id 1)
                CategoriaTematica categoriaPadrao = categoriaRepository.findById(1L).orElseThrow();
                FonteDados fontePadrao = fonteRepository.findById(1L).orElseThrow();

                for (GovDespesaDTO dto : despesasRetornadas) {
                    // Atualizado de getMesAno para getAnoMes
                    if (dto.getAnoMes() != null && dto.getAnoMes().length() == 6) {
                        GastoSocial gasto = new GastoSocial();
                        gasto.setAnoExercicio(Integer.parseInt(dto.getAnoMes().substring(0, 4)));
                        gasto.setMesReferencia(Integer.parseInt(dto.getAnoMes().substring(4, 6)));
                        gasto.setValorGasto(dto.getValorLiquidado());
                        
                        gasto.setCategoriaTematica(categoriaPadrao);
                        gasto.setFonteDados(fontePadrao);
                        
                        gastoRepository.save(gasto);
                    }
                }
                return "Sincronização concluída! " + despesasRetornadas.size() + " registros do Ministério da Educação baixados.";
            }

        } catch (Exception e) {
            System.err.println("Erro na comunicação com a API do Governo: " + e.getMessage());
            return "Falha ao consultar servidores: " + e.getMessage();
        }

        return "Nenhum dado retornado para os parâmetros informados.";
    }
}