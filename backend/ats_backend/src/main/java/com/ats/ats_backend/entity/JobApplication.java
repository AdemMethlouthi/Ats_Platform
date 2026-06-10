package com.ats.ats_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id", nullable = false)
    private JobOffer jobOffer;

    private LocalDateTime appliedAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    private LocalDateTime interviewDate;

    // New fields
    @Column(columnDefinition = "TEXT")
    private String coverLetter;

    private Integer yearsOfExperience;

    private String linkedinUrl;

    private LocalDate availabilityDate;
}