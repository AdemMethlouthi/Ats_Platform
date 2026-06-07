package com.ats.ats_backend.service;

import com.ats.ats_backend.entity.JobApplication;
import com.ats.ats_backend.entity.ApplicationStatus;
import com.ats.ats_backend.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;

    public List<JobApplication> getAllApplications() {
        return jobApplicationRepository.findAll();
    }

    public JobApplication getApplicationById(Long id) {
        return jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));
    }

    public JobApplication apply(JobApplication application) {
        boolean alreadyApplied = jobApplicationRepository
                .existsByCandidateIdAndJobOfferId(
                        application.getCandidate().getId(),
                        application.getJobOffer().getId()
                );
        if (alreadyApplied) {
            throw new RuntimeException("Candidate already applied to this job");
        }
        return jobApplicationRepository.save(application);
    }

    public JobApplication updateStatus(Long id, ApplicationStatus status) {
        JobApplication application = getApplicationById(id);
        application.setStatus(status);
        return jobApplicationRepository.save(application);
    }

    public List<JobApplication> getApplicationsByCandidate(Long candidateId) {
        return jobApplicationRepository.findByCandidateId(candidateId);
    }

    public List<JobApplication> getApplicationsByJob(Long jobId) {
        return jobApplicationRepository.findByJobOfferId(jobId);
    }

    public void deleteApplication(Long id) {
        jobApplicationRepository.deleteById(id);
    }

    public JobApplication scheduleInterview(Long id, LocalDateTime interviewDate) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'scheduleInterview'");
    }
    public JobApplication scheduleInterview1(Long id, LocalDateTime interviewDate) {
    JobApplication application = getApplicationById(id);
    application.setInterviewDate(interviewDate);
    application.setStatus(ApplicationStatus.REVIEWED);
    return jobApplicationRepository.save(application);
}
}