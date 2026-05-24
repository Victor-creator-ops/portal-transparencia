package br.com.fatec.portal_transparencia.models;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "gastos_sociais")
public class GastoSocial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ano_exercicio", nullable = false)
    private Integer anoExercicio;

    @Column(name = "mes_referencia", nullable = false)
    private Integer mesReferencia;

    @Column(name = "valor_gasto", nullable = false, precision = 15, scale = 2)
    private BigDecimal valorGasto;

    @Column(name = "estado_uf", length = 2)
    private String estadoUf;

    @ManyToOne
    @JoinColumn(name = "id_categoria", referencedColumnName = "id")
    private CategoriaTematica categoriaTematica;

    @ManyToOne
    @JoinColumn(name = "id_fonte", referencedColumnName = "id")
    private FonteDados fonteDados;

    public GastoSocial() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getAnoExercicio() {
        return anoExercicio;
    }

    public void setAnoExercicio(Integer anoExercicio) {
        this.anoExercicio = anoExercicio;
    }

    public Integer getMesReferencia() {
        return mesReferencia;
    }

    public void setMesReferencia(Integer mesReferencia) {
        this.mesReferencia = mesReferencia;
    }

    public BigDecimal getValorGasto() {
        return valorGasto;
    }

    public void setValorGasto(BigDecimal valorGasto) {
        this.valorGasto = valorGasto;
    }

    public CategoriaTematica getCategoriaTematica() {
        return categoriaTematica;
    }

    public void setCategoriaTematica(CategoriaTematica categoriaTematica) {
        this.categoriaTematica = categoriaTematica;
    }

    public FonteDados getFonteDados() {
        return fonteDados;
    }

    public void setFonteDados(FonteDados fonteDados) {
        this.fonteDados = fonteDados;
    }

    public String getEstadoUf() { return estadoUf; }
    public void setEstadoUf(String estadoUf) { this.estadoUf = estadoUf; }
}