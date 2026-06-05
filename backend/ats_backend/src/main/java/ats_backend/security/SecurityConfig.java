package ats_backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
                .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/api/files/**").permitAll()
    .requestMatchers("/api/jobs/**").hasAnyRole("HR", "CANDIDATE")
    .requestMatchers("/api/candidates/**").hasRole("HR")
    .requestMatchers("/api/applications/**").hasAnyRole("HR", "CANDIDATE")
    .anyRequest().authenticated()
            );
        return http.build();
    }
}