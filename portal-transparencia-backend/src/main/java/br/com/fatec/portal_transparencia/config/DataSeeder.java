package br.com.fatec.portal_transparencia.config;

import br.com.fatec.portal_transparencia.models.CategoriaTematica;
import br.com.fatec.portal_transparencia.models.FonteDados;
import br.com.fatec.portal_transparencia.repositories.CategoriaTematicaRepository;
import br.com.fatec.portal_transparencia.repositories.FonteDadosRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner popularBancoGastoSocial(
            CategoriaTematicaRepository categoriaRepo, 
            FonteDadosRepository fonteRepo) {
        
        return args -> {
            // Cria a Fonte de Dados (ID 1) se o banco estiver vazio
            if (fonteRepo.count() == 0) {
                FonteDados fonte = new FonteDados();
                fonte.setNomeFonte("Portal da Transparência do Governo Federal");
                fonteRepo.save(fonte);
            }

            // Cria as Categorias Temáticas exatas (IDs 1, 2 e 3)
            if (categoriaRepo.count() == 0) {
                CategoriaTematica cat1 = new CategoriaTematica();
                cat1.setNomeCategoria("Presidência da República");
                categoriaRepo.save(cat1);

                CategoriaTematica cat2 = new CategoriaTematica();
                cat2.setNomeCategoria("Ministério da Agricultura");
                categoriaRepo.save(cat2);

                CategoriaTematica cat3 = new CategoriaTematica();
                cat3.setNomeCategoria("Ministério da Ciência e Tecnologia");
                categoriaRepo.save(cat3);

                CategoriaTematica cat4 = new CategoriaTematica();
                cat4.setNomeCategoria("Ministério da Fazenda");
                categoriaRepo.save(cat4);

                CategoriaTematica cat5 = new CategoriaTematica();
                cat5.setNomeCategoria("Ministério da Educação");
                categoriaRepo.save(cat5);

                CategoriaTematica cat6 = new CategoriaTematica();
                cat6.setNomeCategoria("Ministério da Justiça");
                categoriaRepo.save(cat6);

                CategoriaTematica cat7 = new CategoriaTematica();
                cat7.setNomeCategoria("Ministério da Saúde");
                categoriaRepo.save(cat7);

                CategoriaTematica cat8 = new CategoriaTematica();
                cat8.setNomeCategoria("Ministério dos Transportes");
                categoriaRepo.save(cat8);

                CategoriaTematica cat9 = new CategoriaTematica();
                cat9.setNomeCategoria("Ministério da Defesa");
                categoriaRepo.save(cat9);
            }
        };
    }
}