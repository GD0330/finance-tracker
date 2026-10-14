package com.georgi.financetracker.service;

import com.georgi.financetracker.dto.FinancialSummary;
import com.georgi.financetracker.model.Category;
import com.georgi.financetracker.model.Transaction;
import com.georgi.financetracker.model.TransactionType;
import com.georgi.financetracker.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private TransactionService transactionService;

    @Test
    void shouldCalculateFinancialSummary() {
        Transaction salary = new Transaction(
                new BigDecimal("2000.00"),
                "October salary",
                LocalDate.of(2026, 10, 9),
                TransactionType.INCOME,
                Category.SALARY
        );

        Transaction groceries = new Transaction(
                new BigDecimal("50.00"),
                "Groceries",
                LocalDate.of(2026, 10, 9),
                TransactionType.EXPENSE,
                Category.FOOD
        );

        Transaction rent = new Transaction(
                new BigDecimal("650.00"),
                "Monthly rent",
                LocalDate.of(2026, 10, 9),
                TransactionType.EXPENSE,
                Category.RENT
        );

        when(transactionRepository.findAll())
                .thenReturn(List.of(salary, groceries, rent));


        FinancialSummary summary = transactionService.getFinancialSummary();

        assertEquals(0, new BigDecimal("2000.00").compareTo(summary.totalIncome()));
        assertEquals(0, new BigDecimal("700.00").compareTo(summary.totalExpenses()));
        assertEquals(0, new BigDecimal("1300.00").compareTo(summary.balance()));
    }

    @Test
    void shouldReturnZeroSummaryWhenNoTransactionsExist() {

        when(transactionRepository.findAll())
                .thenReturn(List.of());

        FinancialSummary summary = transactionService.getFinancialSummary();

        assertEquals(0, BigDecimal.ZERO.compareTo(summary.totalIncome()));
        assertEquals(0, BigDecimal.ZERO.compareTo(summary.totalExpenses()));
        assertEquals(0, BigDecimal.ZERO.compareTo(summary.balance()));
    }

    @Test
    void shouldDeleteExistingTransaction() {

        Long transactionId = 1L;

        when(transactionRepository.existsById(transactionId))
                .thenReturn(true);

        transactionService.deleteTransaction(transactionId);

        verify(transactionRepository).deleteById(transactionId);
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonexistentTransaction() {

        Long transactionId = 999L;

        when(transactionRepository.existsById(transactionId))
                .thenReturn(false);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> transactionService.deleteTransaction(transactionId)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());

        verify(transactionRepository, never()).deleteById(transactionId);
    }

    @Test
    void shouldCreateTransaction() {

        // Arrange
        Transaction transaction = new Transaction(
                new BigDecimal("100.00"),
                "Birthday gift",
                LocalDate.of(2026, 10, 14),
                TransactionType.INCOME,
                Category.GIFT
        );

        when(transactionRepository.save(transaction))
                .thenReturn(transaction);

        // Act
        Transaction result = transactionService.addTransaction(transaction);

        // Assert
        assertEquals(transaction, result);

        verify(transactionRepository).save(transaction);
    }

    @Test
    void shouldUpdateExistingTransaction() {

        // Arrange
        Long transactionId = 1L;

        Transaction existing = new Transaction(
                new BigDecimal("25.50"),
                "Groceries",
                LocalDate.of(2026, 10, 9),
                TransactionType.EXPENSE,
                Category.FOOD
        );

        Transaction updated = new Transaction(
                new BigDecimal("45.75"),
                "Weekly groceries",
                LocalDate.of(2026, 10, 14),
                TransactionType.EXPENSE,
                Category.FOOD
        );

        when(transactionRepository.findById(transactionId))
                .thenReturn(Optional.of(existing));

        when(transactionRepository.save(existing))
                .thenReturn(existing);

        // Act
        Transaction result =
                transactionService.updateTransaction(transactionId, updated);

        // Assert
        assertEquals(new BigDecimal("45.75"), result.getAmount());
        assertEquals("Weekly groceries", result.getDescription());
        assertEquals(LocalDate.of(2026, 10, 14), result.getDate());

        verify(transactionRepository).findById(transactionId);
        verify(transactionRepository).save(existing);
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonexistentTransaction() {

        // Arrange
        Long transactionId = 999L;

        Transaction updated = new Transaction(
                new BigDecimal("100.00"),
                "Updated transaction",
                LocalDate.of(2026, 10, 14),
                TransactionType.EXPENSE,
                Category.FOOD
        );

        when(transactionRepository.findById(transactionId))
                .thenReturn(Optional.empty());

        // Act
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> transactionService.updateTransaction(transactionId, updated)
        );

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());

        verify(transactionRepository).findById(transactionId);
        verify(transactionRepository, never()).save(any(Transaction.class));
    }
}
