package lk.ijse.cmjd.researchtracker.user;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {
    boolean existsByUsername(String username);
    User findByUsername(String username);
}