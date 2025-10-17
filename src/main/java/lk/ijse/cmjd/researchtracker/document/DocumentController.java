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

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DocumentService documentService;

    // --- Create a document (metadata only, not file) ---
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

    // --- List documents for a project ---
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PI','MEMBER','VIEWER')")
    public ResponseEntity<List<Document>> getDocumentsByProject(
            @RequestParam("projectId") String projectId
    ) {
        List<Document> docs = documentService.getDocumentsByProject(projectId);
        return ResponseEntity.ok(docs);
    }

    // --- Get details of a document ---
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PI','MEMBER','VIEWER')")
    public ResponseEntity<Document> getDocumentById(@PathVariable String id) {
        return documentService.getDocumentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --- Download a document file ---
    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('ADMIN','PI','MEMBER','VIEWER')")
    public ResponseEntity<Resource> downloadDocument(@PathVariable String id) {
        Path filePath = documentService.getFilePathByDocumentId(id)
                .orElseThrow(() -> new RuntimeException("Document or file not found"));
        try {
            Resource resource = new UrlResource(filePath.toUri());
            String contentType = "application/octet-stream";
            Document doc = documentService.getDocumentById(id).orElse(null);
            String fileName = (doc != null && doc.getTitle() != null) ? doc.getTitle() : filePath.getFileName().toString();
            if (doc != null && doc.getFileType() != null) {
                contentType = doc.getFileType();
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- Update a document ---
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PI', 'MEMBER')")
    public ResponseEntity<Document> updateDocument(@PathVariable String id, @RequestBody Document updated) {
        return ResponseEntity.ok(documentService.updateDocument(id, updated));
    }

    // --- Delete a document ---
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PI', 'MEMBER')")
    public ResponseEntity<?> deleteDocument(@PathVariable String id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}