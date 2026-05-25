package br.com.fatec.portal_transparencia.repositories;

import br.com.fatec.portal_transparencia.models.Licitacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LicitacaoRepository extends JpaRepository<Licitacao, Long> {
    // Trava Anti-Duplicidade para não salvar o mesmo edital duas vezes
    boolean existsByNumeroAndAnoAndOrgao(String numero, Integer ano, String orgao);
}