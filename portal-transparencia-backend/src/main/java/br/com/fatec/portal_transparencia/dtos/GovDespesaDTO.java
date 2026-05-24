package br.com.fatec.portal_transparencia.dtos;

import java.math.BigDecimal;

public class GovDespesaDTO {
    
    //o gov envia o campo com este exato nome (ex: "202604")
    private String anoMes;
    private BigDecimal valorLiquidado;

    // Getters e Setters
    public String getAnoMes() {
        return anoMes;
    }

    public void setAnoMes(String anoMes) {
        this.anoMes = anoMes;
    }

    public BigDecimal getValorLiquidado() {
        return valorLiquidado;
    }

    public void setValorLiquidado(BigDecimal valorLiquidado) {
        this.valorLiquidado = valorLiquidado;
    }
}