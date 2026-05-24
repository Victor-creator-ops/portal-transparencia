package br.com.fatec.portal_transparencia.services;

import br.com.fatec.portal_transparencia.models.CategoriaTematica;
import br.com.fatec.portal_transparencia.models.FonteDados;
import br.com.fatec.portal_transparencia.models.GastoSocial;
import br.com.fatec.portal_transparencia.repositories.CategoriaTematicaRepository;
import br.com.fatec.portal_transparencia.repositories.FonteDadosRepository;
import br.com.fatec.portal_transparencia.repositories.GastoSocialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;

@Service
public class CsvImportService {

    @Autowired
    private GastoSocialRepository gastoRepository;
    
    @Autowired
    private CategoriaTematicaRepository categoriaRepository;
    
    @Autowired
    private FonteDadosRepository fonteRepository;

    // O @Transactional garante que se uma linha der erro, ele cancela tudo (Rollback)
    @Transactional
    public void processarArquivoCsv(MultipartFile arquivo) throws Exception {
        
        try (BufferedReader br = new BufferedReader(new InputStreamReader(arquivo.getInputStream(), StandardCharsets.UTF_8))) {
            String linha;
            boolean primeiraLinha = true;

            while ((linha = br.readLine()) != null) {
                if (primeiraLinha) {
                    primeiraLinha = false;
                    continue;
                }

                String[] colunas = linha.split(",");

                // colunas[0] = ano, colunas[1] = mes, colunas[2] = valor, colunas[3] = idCategoria, colunas[4] = idFonte
                GastoSocial gasto = new GastoSocial();
                gasto.setAnoExercicio(Integer.parseInt(colunas[0].trim()));
                gasto.setMesReferencia(Integer.parseInt(colunas[1].trim()));
                gasto.setValorGasto(new BigDecimal(colunas[2].trim()));

                //busca a categoria e a fonte no banco usando os IDs do CSV
                CategoriaTematica categoria = categoriaRepository.findById(Long.parseLong(colunas[3].trim()))
                        .orElseThrow(() -> new RuntimeException("Categoria não encontrada!"));
                
                FonteDados fonte = fonteRepository.findById(Long.parseLong(colunas[4].trim()))
                        .orElseThrow(() -> new RuntimeException("Fonte não encontrada!"));

                gasto.setCategoriaTematica(categoria);
                gasto.setFonteDados(fonte);

                gastoRepository.save(gasto);
            }
        }
    }
}