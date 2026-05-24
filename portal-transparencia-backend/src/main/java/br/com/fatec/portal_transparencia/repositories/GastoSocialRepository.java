package br.com.fatec.portal_transparencia.repositories;

import br.com.fatec.portal_transparencia.models.GastoSocial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GastoSocialRepository extends JpaRepository<GastoSocial, Long> {
    
    List<GastoSocial> findByAnoExercicioAndEstadoUf(Integer anoExercicio, String estadoUf);
    List<GastoSocial> findByEstadoUf(String estadoUf);
    List<GastoSocial> findByAnoExercicio(Integer anoExercicio);
}