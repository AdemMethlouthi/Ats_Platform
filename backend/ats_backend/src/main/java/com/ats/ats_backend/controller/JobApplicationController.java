package com.ats.ats_backend.controller;

import com.ats.ats_backend.entity.JobApplication;
import com.ats.ats_backend.entity.ApplicationStatus;
import com.ats.ats_backend.service.JobApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @GetMapping
    public List<JobApplication> getAllApplications() {
        return jobApplicationService.getAllApplications();
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplication> getApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(jobApplicationService.getApplicationById(id));
    }

    @GetMapping("/candidate/{candidateId}")
    public List<JobApplication> getByCandidate(@PathVariable Long candidateId) {
        return jobApplicationService.getApplicationsByCandidate(candidateId);
    }

    @GetMapping("/job/{jobId}")
    public List<JobApplication> getByJob(@PathVariable Long jobId) {
        return jobApplicationService.getApplicationsByJob(jobId);
    }

    @PostMapping
    public ResponseEntity<JobApplication> apply(@RequestBody JobApplication application) {
        return ResponseEntity.ok(jobApplicationService.apply(application));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobApplication> updateStatus(@PathVariable Long id,
                                                        @RequestParam ApplicationStatus status) {
        return ResponseEntity.ok(jobApplicationService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        jobApplicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}