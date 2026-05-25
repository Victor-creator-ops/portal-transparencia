package br.com.fatec.portal_transparencia.controllers;

import br.com.fatec.portal_transparencia.dtos.ApiResponse;
import br.com.fatec.portal_transparencia.models.Licitacao;
import br.com.fatec.portal_transparencia.services.LicitacaoService;
import br.com.fatec.portal_transparencia.services.GovApiClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/licitacoes")
@CrossOrigin(origins = "*")
public class LicitacaoController {

    @Autowired
    private LicitacaoService service;

    @Autowired
    private GovApiClientService govService; // Injetamos o serviço de sincronização

    @GetMapping
    public ResponseEntity<ApiResponse<List<Licitacao>>> listar() {
        List<Licitacao> lista = service.listarTodos();
        return ResponseEntity.ok(new ApiResponse<>(true, "Licitações listadas com sucesso.", lista));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Licitacao>> salvar(@RequestBody Licitacao licitacao) {
        Licitacao salva = service.salvar(licitacao);
        return ResponseEntity.ok(new ApiResponse<>(true, "Licitação salva com sucesso.", salva));
    }

    // NOVA ROTA: Sincronização direta com a API do Governo Federal
    @PostMapping("/sincronizar-gov")
    public ResponseEntity<ApiResponse<Object>> sincronizarGov(
            @RequestParam(defaultValue = "01/01/2024") String dataInicial,
            @RequestParam(defaultValue = "31/12/2024") String dataFinal,
            @RequestParam(defaultValue = "26000") String orgao) {
        
        ApiResponse<Object> resultado = govService.sincronizarLicitacoesGoverno(dataInicial, dataFinal, orgao);
        return ResponseEntity.ok(resultado);
    }
}