package com.ats.ats_backend.service;

import com.ats.ats_backend.entity.JobOffer;
import com.ats.ats_backend.entity.JobStatus;
import com.ats.ats_backend.repository.JobOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobOfferService {

    private final JobOfferRepository jobOfferRepository;

    public List<JobOffer> getAllJobs() {
        return jobOfferRepository.findAll();
    }

    public JobOffer getJobById(Long id) {
        return jobOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));
    }

    public JobOffer createJob(JobOffer jobOffer) {
        return jobOfferRepository.save(jobOffer);
    }

    public JobOffer updateJob(Long id, JobOffer updated) {
        JobOffer existing = getJobById(id);
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setLocation(updated.getLocation());
        existing.setContractType(updated.getContractType());
        existing.setDeadline(updated.getDeadline());
        existing.setStatus(updated.getStatus());
        return jobOfferRepository.save(existing);
    }

    public void deleteJob(Long id) {
        jobOfferRepository.deleteById(id);
    }

    public List<JobOffer> getOpenJobs() {
        return jobOfferRepository.findByStatus(JobStatus.OPEN);
    }
}