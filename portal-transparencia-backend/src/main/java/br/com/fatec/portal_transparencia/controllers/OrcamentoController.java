package br.com.fatec.portal_transparencia.controllers;

import br.com.fatec.portal_transparencia.dtos.ApiResponse;
import br.com.fatec.portal_transparencia.models.Orcamento;
import br.com.fatec.portal_transparencia.services.OrcamentoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orcamentos")
@CrossOrigin(origins = "*")
public class OrcamentoController {

    @Autowired
    private OrcamentoService service;

    public OrcamentoController(OrcamentoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Orcamento>>> listar(@RequestParam(required = false) Integer ano) {
        List<Orcamento> lista = service.listarTodos(ano);
        return ResponseEntity.ok(new ApiResponse<>(true, "Orçamentos listados com sucesso.", lista));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Orcamento>> buscarPorId(@PathVariable Long id) {
        Optional<Orcamento> orcamento = service.buscarPorId(id);
        return orcamento.map(o -> ResponseEntity.ok(new ApiResponse<>(true, "Orçamento encontrado.", o)))
                .orElseGet(() -> ResponseEntity.status(404).body(new ApiResponse<>(false, "Orçamento não encontrado.", null)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Orcamento>> salvar(@RequestBody Orcamento orcamento) {
        Orcamento salvo = service.salvar(orcamento);
        return ResponseEntity.ok(new ApiResponse<>(true, "Orçamento salvo com sucesso.", salvo));
    }
}