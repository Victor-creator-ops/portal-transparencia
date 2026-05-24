package br.com.fatec.portal_transparencia.dtos;

public class GovDespesaDTO {
    
    private Integer ano;
    
    private String liquidado;

    // Getters e Setters
    public Integer getAno() {
        return ano;
    }

    public void setAno(Integer ano) {
        this.ano = ano;
    }

    public String getLiquidado() {
        return liquidado;
    }

    public void setLiquidado(String liquidado) {
        this.liquidado = liquidado;
    }
}