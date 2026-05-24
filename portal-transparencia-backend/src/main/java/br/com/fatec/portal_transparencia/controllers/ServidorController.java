package br.com.fatec.portal_transparencia.controllers;

import br.com.fatec.portal_transparencia.dtos.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/servidores")
@CrossOrigin(origins = "*")
@Tag(name = "Servidores", description = "Rotas para consulta de servidores públicos no Portal da Transparência")
public class ServidorController {

    @Value("${gov.api.transparencia.url}")
    private String apiUrl;

    @Value("${gov.api.transparencia.chave}")
    private String apiChave;

    @GetMapping
    @Operation(
        summary = "Buscar lista de servidores", 
        description = "Faz uma requisição paginada à API do Governo Federal para buscar os servidores públicos de acordo com os filtros informados."
    )
    public ResponseEntity<ApiResponse<List<Object>>> buscarServidores(
            @Parameter(description = "Sigla do Estado (ex: SP, RJ, MG)") 
            @RequestParam(defaultValue = "SP") String estado,
            
            @Parameter(description = "Página inicial da consulta") 
            @RequestParam(defaultValue = "1") Integer pagina,
            
            @Parameter(description = "Quantidade de páginas a serem buscadas em sequência") 
            @RequestParam(defaultValue = "1") Integer qtdPaginas,
            
            @Parameter(description = "Código do Órgão no Governo (ex: 26000 para Educação)") 
            @RequestParam(defaultValue = "26000") String orgao,
            
            @Parameter(description = "Nome do servidor para busca específica (opcional)") 
            @RequestParam(required = false) String nome,
            
            @Parameter(description = "Código numérico do tipo de servidor") 
            @RequestParam(defaultValue = "1") Integer tipoServidor,
            
            @Parameter(description = "Código numérico da situação do servidor") 
            @RequestParam(defaultValue = "1") Integer situacaoServidor) { 
        
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(15000); 
        factory.setReadTimeout(30000); 
        
        RestTemplate restTemplate = new RestTemplate(factory);

        HttpHeaders headers = new HttpHeaders();
        headers.set("chave-api-dados", apiChave);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        List<Object> todosServidores = new ArrayList<>();

        try {
            for (int i = 0; i < qtdPaginas; i++) {
                int paginaAtual = pagina + i;
                
                StringBuilder url = new StringBuilder(apiUrl + "/servidores?");
                url.append("pagina=").append(paginaAtual);
                url.append("&licencaUf=").append(estado);
                url.append("&orgaoServidorExercicio=").append(orgao);
                url.append("&tipoServidor=").append(tipoServidor);
                url.append("&situacaoServidor=").append(situacaoServidor);
                
                if (nome != null && !nome.trim().isEmpty()) {
                    url.append("&nome=").append(nome.trim());
                }

                ResponseEntity<Object[]> response = restTemplate.exchange(
                    url.toString(), 
                    HttpMethod.GET, 
                    entity, 
                    Object[].class
                );
                
                if (response.getBody() != null) {
                    todosServidores.addAll(Arrays.asList(response.getBody()));
                }
            }
            
            return ResponseEntity.ok(new ApiResponse<>(
                true, 
                "Foram encontrados " + todosServidores.size() + " servidores.", 
                todosServidores
            ));
            
        } catch (RestClientResponseException e) {
            int statusCode = e.getStatusCode().value();
            String mensagemErro = "O servidor do Governo recusou a conexão (Erro " + statusCode + "). Tente novamente mais tarde.";
            System.err.println("Erro HTTP Governo: " + e.getResponseBodyAsString());
            
            return ResponseEntity.status(statusCode).body(new ApiResponse<>(
                false, 
                mensagemErro, 
                new ArrayList<>()
            ));
            
        } catch (Exception e) {
            System.err.println("Erro interno da nossa API: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                false, 
                "Falha interna ao processar a busca de servidores.", 
                new ArrayList<>()
            ));
        }
    }
}