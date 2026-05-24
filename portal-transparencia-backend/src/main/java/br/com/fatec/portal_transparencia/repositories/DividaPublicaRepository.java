package br.com.fatec.portal_transparencia.repositories;

import br.com.fatec.portal_transparencia.models.DividaPublica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DividaPublicaRepository extends JpaRepository<DividaPublica, Long> {
    List<DividaPublica> findByAnoExercicio(Integer anoExercicio);
    List<DividaPublica> findByTipoDividaContainingIgnoreCase(String tipoDivida);
    List<DividaPublica> findByAnoExercicioAndTipoDividaContainingIgnoreCase(Integer anoExercicio, String tipoDivida);
}