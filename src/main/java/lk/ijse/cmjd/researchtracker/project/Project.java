package lk.ijse.cmjd.researchtracker.project;

import jakarta.persistence.*;
import lk.ijse.cmjd.researchtracker.user.User;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    @Id
    private String id = UUID.randomUUID().toString();

    @Column(nullable = false)
    private String title;

    private String summary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PLANNING;

    @ManyToOne
    @JoinColumn(name = "pi_id")
    private User pi;

    private String tags; // comma-separated tags

    private LocalDate startDate;
    private LocalDate endDate;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum Status {
        PLANNING,
        ACTIVE,
        ON_HOLD,
        COMPLETED,
        ARCHIVED
    }
}