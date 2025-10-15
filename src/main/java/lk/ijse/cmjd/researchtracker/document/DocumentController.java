package lk.ijse.cmjd.researchtracker.document;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DocumentService documentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PI', 'MEMBER')")
    public ResponseEntity<Document> createDocument(
            @RequestBody Document document,
            @RequestParam String projectId,
            @RequestParam String uploaderUsername
    ) {
        Document created = documentService.createDocument(document, projectId, uploaderUsername);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Document>> getDocumentsByProject(@PathVariable String projectId) {
        return ResponseEntity.ok(documentService.getDocumentsByProject(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable String id) {
        return documentService.getDocumentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PI', 'MEMBER')")
    public ResponseEntity<Document> updateDocument(@PathVariable String id, @RequestBody Document updated) {
        return ResponseEntity.ok(documentService.updateDocument(id, updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PI', 'MEMBER')")
    public ResponseEntity<?> deleteDocument(@PathVariable String id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    // --- File upload endpoint ---
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'PI', 'MEMBER')")
    public ResponseEntity<Document> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("projectId") String projectId,
            @RequestParam("uploaderUsername") String uploaderUsername,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description
    ) {
        try {
            Document doc = documentService.uploadFile(file, projectId, uploaderUsername, title, description);
            return new ResponseEntity<>(doc, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- File download endpoint ---
    @GetMapping("/download/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PI', 'MEMBER')")
    public ResponseEntity<Resource> downloadDocument(@PathVariable String id) {
        Optional<Document> docOpt = documentService.getDocumentById(id);
        if (docOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Document doc = docOpt.get();
        try {
            Path filePath = Path.of(doc.getUrlOrPath());
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(doc.getFileType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getTitle() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}