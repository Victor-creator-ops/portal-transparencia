package br.com.fatec.portal_transparencia.controllers;

import br.com.fatec.portal_transparencia.dtos.ApiResponse;
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
    public ResponseEntity<ApiResponse<List<DividaPublica>>> listar(
            @RequestParam(required = false) Integer ano,
            @RequestParam(required = false) String tipo) {
        List<DividaPublica> lista = service.buscarComFiltros(ano, tipo);
        return ResponseEntity.ok(new ApiResponse<>(true, "Dívidas listadas com sucesso.", lista));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DividaPublica>> buscarPorId(@PathVariable Long id) {
        Optional<DividaPublica> divida = service.buscarPorId(id);
        return divida.map(d -> ResponseEntity.ok(new ApiResponse<>(true, "Dívida encontrada.", d)))
                .orElseGet(() -> ResponseEntity.status(404).body(new ApiResponse<>(false, "Dívida não encontrada.", null)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DividaPublica>> salvar(@RequestBody DividaPublica dividaPublica) {
        DividaPublica salva = service.salvar(dividaPublica);
        return ResponseEntity.ok(new ApiResponse<>(true, "Dívida salva com sucesso.", salva));
    }
}