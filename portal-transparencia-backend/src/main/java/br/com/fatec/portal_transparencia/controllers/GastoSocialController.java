package br.com.fatec.portal_transparencia.controllers;

import br.com.fatec.portal_transparencia.dtos.ApiResponse;
import br.com.fatec.portal_transparencia.models.GastoSocial;
import br.com.fatec.portal_transparencia.services.GastoSocialService;
import br.com.fatec.portal_transparencia.services.GovApiClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/gastos")
@CrossOrigin(origins = "*")
public class GastoSocialController {

    @Autowired
    private GastoSocialService service;

    @Autowired
    private GovApiClientService govService;

    public GastoSocialController(GastoSocialService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GastoSocial>>> listar(
            @RequestParam(required = false) Integer ano,
            @RequestParam(required = false) String estado) {
        List<GastoSocial> lista = service.listarTodos(ano, estado);
        return ResponseEntity.ok(new ApiResponse<>(true, "Gastos listados com sucesso.", lista));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GastoSocial>> buscarPorId(@PathVariable Long id) {
        Optional<GastoSocial> gasto = service.buscarPorId(id);
        return gasto.map(g -> ResponseEntity.ok(new ApiResponse<>(true, "Gasto encontrado.", g)))
                .orElseGet(() -> ResponseEntity.status(404).body(new ApiResponse<>(false, "Gasto não encontrado.", null)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GastoSocial>> salvar(@RequestBody GastoSocial gastoSocial) {
        GastoSocial salvo = service.salvar(gastoSocial);
        return ResponseEntity.ok(new ApiResponse<>(true, "Gasto salvo com sucesso.", salvo));
    }

    @PostMapping("/sincronizar-gov")
    @SuppressWarnings("unchecked")
    public ResponseEntity<ApiResponse<Object>> buscarDadosGoverno(
            @RequestParam(defaultValue = "2024") Integer ano,
            @RequestParam(defaultValue = "1") Integer pagina,
            @RequestParam(defaultValue = "DF") String estado,
            @RequestParam(defaultValue = "26000") String orgao) {
        
        Object resultado = govService.sincronizarDespesasGoverno(ano, pagina, estado, orgao);
        
        if (resultado instanceof ApiResponse) {
            return ResponseEntity.ok((ApiResponse<Object>) resultado);
        } else {
            return ResponseEntity.ok(new ApiResponse<>(true, "Sincronização executada.", resultado));
        }
    }

    @DeleteMapping("/limpar")
    public ResponseEntity<ApiResponse<String>> limparBase() {
        service.limparTodosOsRegistros();
        return ResponseEntity.ok(new ApiResponse<>(true, "Base de dados zerada com sucesso.", null));
    }
}