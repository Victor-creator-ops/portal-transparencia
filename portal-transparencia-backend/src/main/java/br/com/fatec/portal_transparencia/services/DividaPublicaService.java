package br.com.fatec.portal_transparencia.services;

import br.com.fatec.portal_transparencia.models.DividaPublica;
import br.com.fatec.portal_transparencia.repositories.DividaPublicaRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;

@Service
public class DividaPublicaService {

    @Autowired
    private DividaPublicaRepository repository;

    public DividaPublicaService(DividaPublicaRepository repository) {
        this.repository = repository;
    }

    public List<DividaPublica> listarTodas() {
        return repository.findAll();
    }

    public List<DividaPublica> buscarComFiltros(Integer ano, String tipo) {
        if (ano != null && tipo != null && !tipo.isEmpty()) {
            return repository.findByAnoExercicioAndTipoDividaContainingIgnoreCase(ano, tipo);
        } else if (ano != null) {
            return repository.findByAnoExercicio(ano);
        } else if (tipo != null && !tipo.isEmpty()) {
            return repository.findByTipoDividaContainingIgnoreCase(tipo);
        }
        return repository.findAll();
    }
    
    public Optional<DividaPublica> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public DividaPublica salvar(DividaPublica dividaPublica) {
        return repository.save(dividaPublica);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}