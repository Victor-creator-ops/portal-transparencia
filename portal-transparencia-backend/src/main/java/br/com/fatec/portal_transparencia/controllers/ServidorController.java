package br.com.fatec.portal_transparencia.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/servidores")
@CrossOrigin(origins = "*")
public class ServidorController {

    @Value("${gov.api.transparencia.url}")
    private String apiUrl;

    @Value("${gov.api.transparencia.chave}")
    private String apiChave;

    @GetMapping
    public ResponseEntity<Object> buscarServidores(
            @RequestParam(defaultValue = "SP") String estado,
            @RequestParam(defaultValue = "1") Integer pagina,
            @RequestParam(defaultValue = "1") Integer qtdPaginas,
            @RequestParam(defaultValue = "26000") String orgao,
            @RequestParam(required = false) String nome,
            @RequestParam(defaultValue = "1") Integer tipoServidor,
            @RequestParam(defaultValue = "1") Integer situacaoServidor) { 
        
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000); 
        factory.setReadTimeout(10000); 
        
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

                ResponseEntity<Object[]> response = restTemplate.exchange(url.toString(), HttpMethod.GET, entity, Object[].class);
                
                if (response.getBody() != null) {
                    todosServidores.addAll(Arrays.asList(response.getBody()));
                }
            }
            return ResponseEntity.ok(todosServidores);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Erro ao buscar servidores: " + e.getMessage());
        }
    }
}