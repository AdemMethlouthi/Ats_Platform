package com.ats.ats_backend.controller;

import com.ats.ats_backend.entity.JobOffer;
import com.ats.ats_backend.service.JobOfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class JobOfferController {

    private final JobOfferService jobOfferService;

    @GetMapping
    public List<JobOffer> getAllJobs() {
        return jobOfferService.getAllJobs();
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobOffer> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobOfferService.getJobById(id));
    }

    @GetMapping("/open")
    public List<JobOffer> getOpenJobs() {
        return jobOfferService.getOpenJobs();
    }

    @PostMapping
    public ResponseEntity<JobOffer> createJob(@RequestBody JobOffer jobOffer) {
        return ResponseEntity.ok(jobOfferService.createJob(jobOffer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobOffer> updateJob(@PathVariable Long id,
                                               @RequestBody JobOffer jobOffer) {
        return ResponseEntity.ok(jobOfferService.updateJob(id, jobOffer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobOfferService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }
}