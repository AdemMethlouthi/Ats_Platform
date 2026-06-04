package com.ats.ats_backend.service;

import com.ats.ats_backend.entity.Candidate;
import com.ats.ats_backend.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private final CandidateRepository candidateRepository;

    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    public Candidate getCandidateById(Long id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found: " + id));
    }

    public Candidate createCandidate(Candidate candidate) {
        if (candidateRepository.existsByEmail(candidate.getEmail())) {
            throw new RuntimeException("Email already exists: " + candidate.getEmail());
        }
        return candidateRepository.save(candidate);
    }

    public Candidate updateCandidate(Long id, Candidate updated) {
        Candidate existing = getCandidateById(id);
        existing.setFullName(updated.getFullName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        return candidateRepository.save(existing);
    }

    public void deleteCandidate(Long id) {
        candidateRepository.deleteById(id);
    }
}