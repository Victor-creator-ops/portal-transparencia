package br.com.fatec.portal_transparencia.services;

import br.com.fatec.portal_transparencia.models.GastoSocial;
import br.com.fatec.portal_transparencia.repositories.GastoSocialRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GastoSocialService {

    @Autowired
    private GastoSocialRepository repository;

    public GastoSocialService(GastoSocialRepository repository) {
        this.repository = repository;
    }

    public List<GastoSocial> listarTodos(Integer ano) {
        if (ano != null) {
            return repository.findByAnoExercicio(ano);
        }
        return repository.findAll();
    }

    public Optional<GastoSocial> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public GastoSocial salvar(GastoSocial gastoSocial) {
        return repository.save(gastoSocial);
    }
    
    public void deletar(Long id) {
        repository.deleteById(id);
    }
}