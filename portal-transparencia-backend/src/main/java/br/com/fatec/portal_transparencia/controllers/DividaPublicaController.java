package br.com.fatec.portal_transparencia.controllers;

import br.com.fatec.portal_transparencia.models.DividaPublica;
import br.com.fatec.portal_transparencia.services.DividaPublicaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/dividas")
@CrossOrigin(origins = "*")
public class DividaPublicaController {

    @Autowired
    private DividaPublicaService service;

    public DividaPublicaController(DividaPublicaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<DividaPublica>> listar(
            @RequestParam(required = false) Integer ano,
            @RequestParam(required = false) String tipo) {
        return ResponseEntity.ok(service.buscarComFiltros(ano, tipo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DividaPublica> buscarPorId(@PathVariable Long id) {
        Optional<DividaPublica> divida = service.buscarPorId(id);
        return divida.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DividaPublica> salvar(@RequestBody DividaPublica dividaPublica) {
        return ResponseEntity.ok(service.salvar(dividaPublica));
    }
}