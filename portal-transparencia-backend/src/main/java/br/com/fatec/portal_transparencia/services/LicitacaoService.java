package br.com.fatec.portal_transparencia.services;

import br.com.fatec.portal_transparencia.models.Licitacao;
import br.com.fatec.portal_transparencia.repositories.LicitacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LicitacaoService {

    @Autowired
    private LicitacaoRepository repository;

    public List<Licitacao> listarTodos() {
        return repository.findAll();
    }

    public Licitacao salvar(Licitacao licitacao) {
        if (repository.existsByNumeroAndAnoAndOrgao(licitacao.getNumero(), licitacao.getAno(), licitacao.getOrgao())) {
            return licitacao; // Ignora duplicado
        }
        return repository.save(licitacao);
    }

    public void limparTodosOsRegistros() {
        repository.deleteAll();
    }
}