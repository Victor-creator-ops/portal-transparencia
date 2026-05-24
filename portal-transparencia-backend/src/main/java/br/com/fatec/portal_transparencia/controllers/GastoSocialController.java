package br.com.fatec.portal_transparencia.controllers;

import br.com.fatec.portal_transparencia.dtos.ApiResponse;
import br.com.fatec.portal_transparencia.models.GastoSocial;
import br.com.fatec.portal_transparencia.services.GastoSocialService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/gastos")
@CrossOrigin(origins = "*")
public class GastoSocialController {

    @Autowired
    private GastoSocialService service;

    @Autowired
    private br.com.fatec.portal_transparencia.services.CsvImportService csvService;

    @Autowired
    private br.com.fatec.portal_transparencia.services.GovApiClientService govService;

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

    @PostMapping("/importar")
    public ResponseEntity<ApiResponse<String>> importarPlanilha(@RequestParam("arquivo") MultipartFile arquivo) {
        try {
            csvService.processarArquivoCsv(arquivo);
            return ResponseEntity.ok(new ApiResponse<>(true, "Processamento ETL concluído com sucesso!", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Falha ao processar arquivo: " + e.getMessage(), null));
        }
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