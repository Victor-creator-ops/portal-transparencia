package br.com.fatec.portal_transparencia.controllers;

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
    public ResponseEntity<List<GastoSocial>> listar(
            @RequestParam(required = false) Integer ano,
            @RequestParam(required = false) String estado) {
        return ResponseEntity.ok(service.listarTodos(ano, estado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GastoSocial> buscarPorId(@PathVariable Long id) {
        Optional<GastoSocial> gasto = service.buscarPorId(id);
        return gasto.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<GastoSocial> salvar(@RequestBody GastoSocial gastoSocial) {
        return ResponseEntity.ok(service.salvar(gastoSocial));
    }

    @PostMapping("/importar")
    public ResponseEntity<String> importarPlanilha(@RequestParam("arquivo") MultipartFile arquivo) {
        try {
            csvService.processarArquivoCsv(arquivo);
            return ResponseEntity.ok("Processamento ETL concluído com sucesso!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Falha ao processar arquivo: " + e.getMessage());
        }
    }

    @PostMapping("/sincronizar-gov")
    public ResponseEntity<String> buscarDadosGoverno(
            @RequestParam(defaultValue = "2024") Integer ano,
            @RequestParam(defaultValue = "1") Integer pagina,
            @RequestParam(defaultValue = "DF") String estado,
            @RequestParam(defaultValue = "26000") String orgao) { 
        
        String resultado = govService.sincronizarDespesasGoverno(ano, pagina, estado, orgao);
        
        if (resultado.contains("Falha")) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(resultado);
        }
        return ResponseEntity.ok(resultado);
    }

    @DeleteMapping("/limpar")
    public ResponseEntity<String> limparBase() {
        service.limparTodosOsRegistros();
        return ResponseEntity.ok("Base de dados zerada com sucesso.");
    }
}