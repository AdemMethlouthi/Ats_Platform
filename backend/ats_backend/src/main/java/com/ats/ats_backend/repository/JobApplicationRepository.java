package com.ats.ats_backend.repository;

import com.ats.ats_backend.entity.JobApplication;
import com.ats.ats_backend.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByCandidateId(Long candidateId);
    List<JobApplication> findByJobOfferId(Long jobOfferId);
    List<JobApplication> findByStatus(ApplicationStatus status);
    boolean existsByCandidateIdAndJobOfferId(Long candidateId, Long jobOfferId);
}