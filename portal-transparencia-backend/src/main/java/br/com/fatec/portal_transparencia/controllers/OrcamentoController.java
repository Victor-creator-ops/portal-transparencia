package br.com.fatec.portal_transparencia.controllers;

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
    public ResponseEntity<List<Orcamento>> listar(@RequestParam(required = false) Integer ano) {
        return ResponseEntity.ok(service.listarTodos(ano));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Orcamento> buscarPorId(@PathVariable Long id) {
        Optional<Orcamento> orcamento = service.buscarPorId(id);
        return orcamento.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Orcamento> salvar(@RequestBody Orcamento orcamento) {
        return ResponseEntity.ok(service.salvar(orcamento));
    }
}