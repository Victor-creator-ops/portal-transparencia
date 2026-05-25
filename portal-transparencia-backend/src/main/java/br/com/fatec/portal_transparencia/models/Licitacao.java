package br.com.fatec.portal_transparencia.models;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "licitacoes")
public class Licitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String numero;

    @Column(nullable = false)
    private Integer ano;

    @Column(nullable = false)
    private String orgao;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String objeto;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private String situacao;

    @ManyToOne
    @JoinColumn(name = "id_fonte", referencedColumnName = "id")
    private FonteDados fonteDados;

    public Licitacao() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public Integer getAno() { return ano; }
    public void setAno(Integer ano) { this.ano = ano; }

    public String getOrgao() { return orgao; }
    public void setOrgao(String orgao) { this.orgao = orgao; }

    public String getObjeto() { return objeto; }
    public void setObjeto(String objeto) { this.objeto = objeto; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public String getSituacao() { return situacao; }
    public void setSituacao(String situacao) { this.situacao = situacao; }

    public FonteDados getFonteDados() { return fonteDados; }
    public void setFonteDados(FonteDados fonteDados) { this.fonteDados = fonteDados; }
}