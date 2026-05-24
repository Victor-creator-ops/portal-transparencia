package br.com.fatec.portal_transparencia.repositories;

import br.com.fatec.portal_transparencia.models.Orcamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrcamentoRepository extends JpaRepository<Orcamento, Long> {
  List<Orcamento> findByAnoExercicio(Integer anoExercicio);
}