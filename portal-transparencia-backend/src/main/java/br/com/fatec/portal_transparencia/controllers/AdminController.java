package br.com.fatec.portal_transparencia.controllers;

import br.com.fatec.portal_transparencia.dtos.ApiResponse;
import br.com.fatec.portal_transparencia.services.GastoSocialService;
import br.com.fatec.portal_transparencia.services.LicitacaoService;
import br.com.fatec.portal_transparencia.services.DividaPublicaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private GastoSocialService gastoService;
    
    @Autowired
    private LicitacaoService licitacaoService;
    
    @Autowired
    private DividaPublicaService dividaService;

    @DeleteMapping("/limpar-banco")
    public ResponseEntity<ApiResponse<String>> limparBancoDeDados() {
        try {
            gastoService.limparTodosOsRegistros();
            licitacaoService.limparTodosOsRegistros();
            dividaService.limparTodosOsRegistros();
            return ResponseEntity.ok(new ApiResponse<>(true, "Base de dados limpa com sucesso. Todos os lixos e duplicados foram apagados.", null));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "Erro ao limpar a base de dados: " + e.getMessage(), null));
        }
    }
}