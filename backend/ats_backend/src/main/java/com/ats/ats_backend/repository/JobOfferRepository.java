package com.ats.ats_backend.repository;

import com.ats.ats_backend.entity.JobOffer;
import com.ats.ats_backend.entity.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {
    List<JobOffer> findByStatus(JobStatus status);
    List<JobOffer> findByTitleContaining(String keyword);
}