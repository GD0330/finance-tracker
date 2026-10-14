package com.georgi.financetracker.dto;

import java.math.BigDecimal;

public record FinancialSummary(
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal balance
) {
}
