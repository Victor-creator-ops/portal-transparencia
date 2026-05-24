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
            @RequestParam(defaultValue = "1") Integer qtdPaginas) {
        
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000); 
        factory.setReadTimeout(10000); 
        
        RestTemplate restTemplate = new RestTemplate(factory);

        HttpHeaders headers = new HttpHeaders();
        headers.set("chave-api-dados", apiChave);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        List<Object> todosServidores = new ArrayList<>();

        try {
            for (int i = 0; i < qtdPaginas; i++) {
                int paginaAtual = pagina + i;
                
                // CORREÇÃO: Adicionado "&tipoServidor=1" (Servidor Civil) para o governo não recusar a busca
                String url = apiUrl + "/servidores?licencaUf=" + estado + "&tipoServidor=1&pagina=" + paginaAtual;

                ResponseEntity<Object[]> response = restTemplate.exchange(url, HttpMethod.GET, entity, Object[].class);
                
                if (response.getBody() != null) {
                    todosServidores.addAll(Arrays.asList(response.getBody()));
                }
            }
            return ResponseEntity.ok(todosServidores);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("Erro ao buscar servidores: " + e.getMessage());
        }
    }
}