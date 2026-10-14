package com.georgi.financetracker.controller;

import com.georgi.financetracker.service.TransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.georgi.financetracker.model.Transaction;
import com.georgi.financetracker.model.TransactionType;
import com.georgi.financetracker.model.Category;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import org.springframework.http.MediaType;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@WebMvcTest(TransactionController.class)
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TransactionService transactionService;

    @Test
    void shouldReturnEmptyTransactionList() throws Exception {

        when(transactionService.getAllTransactions())
                .thenReturn(java.util.List.of());

        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void shouldCreateTransaction() throws Exception {

        // Arrange
        Transaction savedTransaction = new Transaction(
                new BigDecimal("150.00"),
                "Freelance payment",
                LocalDate.of(2026, 10, 14),
                TransactionType.INCOME,
                Category.SALARY
        );

        when(transactionService.addTransaction(any(Transaction.class)))
                .thenReturn(savedTransaction);

        String requestJson = """
            {
                "amount": 150.00,
                "description": "Freelance payment",
                "date": "2026-10-14",
                "type": "INCOME",
                "category": "SALARY"
            }
            """;

        // Act & Assert
        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(150.00))
                .andExpect(jsonPath("$.description").value("Freelance payment"))
                .andExpect(jsonPath("$.type").value("INCOME"))
                .andExpect(jsonPath("$.category").value("SALARY"));
    }

    @Test
    void shouldRejectNegativeAmount() throws Exception {

        String requestJson = """
            {
                "amount": -50.00,
                "description": "Invalid expense",
                "date": "2026-10-14",
                "type": "EXPENSE",
                "category": "FOOD"
            }
            """;

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.amount").exists());

        verify(transactionService, never())
                .addTransaction(any(Transaction.class));
    }

    @Test
    void shouldRejectEmptyDescription() throws Exception {

        String requestJson = """
            {
                "amount": 50.00,
                "description": "",
                "date": "2026-10-14",
                "type": "EXPENSE",
                "category": "FOOD"
            }
            """;

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.description").exists());

        verify(transactionService, never())
                .addTransaction(any(Transaction.class));
    }

    @Test
    void shouldDeleteTransaction() throws Exception {

        // Arrange
        Long transactionId = 1L;

        doNothing()
                .when(transactionService)
                .deleteTransaction(transactionId);

        // Act & Assert
        mockMvc.perform(delete("/api/transactions/{id}", transactionId))
                .andExpect(status().isNoContent());

        verify(transactionService).deleteTransaction(transactionId);
    }

    @Test
    void shouldReturnNotFoundWhenDeletingNonexistentTransaction()
            throws Exception {

        // Arrange
        Long transactionId = 999L;

        doThrow(new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Transaction not found"
        )).when(transactionService)
                .deleteTransaction(transactionId);

        // Act & Assert
        mockMvc.perform(delete("/api/transactions/{id}", transactionId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        verify(transactionService).deleteTransaction(transactionId);
    }

    @Test
    void shouldUpdateTransaction() throws Exception {

        // Arrange
        Long transactionId = 1L;

        Transaction updatedTransaction = new Transaction(
                new BigDecimal("75.00"),
                "Updated groceries",
                LocalDate.of(2026, 10, 14),
                TransactionType.EXPENSE,
                Category.FOOD
        );

        when(transactionService.updateTransaction(
                org.mockito.ArgumentMatchers.eq(transactionId),
                any(Transaction.class)
        )).thenReturn(updatedTransaction);

        String requestJson = """
            {
                "amount": 75.00,
                "description": "Updated groceries",
                "date": "2026-10-14",
                "type": "EXPENSE",
                "category": "FOOD"
            }
            """;

        // Act & Assert
        mockMvc.perform(put("/api/transactions/{id}", transactionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(75.00))
                .andExpect(jsonPath("$.description").value("Updated groceries"))
                .andExpect(jsonPath("$.type").value("EXPENSE"))
                .andExpect(jsonPath("$.category").value("FOOD"));

        verify(transactionService).updateTransaction(
                org.mockito.ArgumentMatchers.eq(transactionId),
                any(Transaction.class)
        );
    }

    @Test
    void shouldReturnNotFoundWhenUpdatingNonexistentTransaction()
            throws Exception {

        // Arrange
        Long transactionId = 999L;

        when(transactionService.updateTransaction(
                eq(transactionId),
                any(Transaction.class)
        )).thenThrow(new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Transaction not found"
        ));

        String requestJson = """
            {
                "amount": 100.00,
                "description": "Updated expense",
                "date": "2026-10-14",
                "type": "EXPENSE",
                "category": "FOOD"
            }
            """;

        // Act & Assert
        mockMvc.perform(put("/api/transactions/{id}", transactionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        verify(transactionService).updateTransaction(
                eq(transactionId),
                any(Transaction.class)
        );
    }
}