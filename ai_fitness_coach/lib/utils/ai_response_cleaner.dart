
class AIResponseCleaner {
  /// Cleans AI responses by removing JSON blocks and artifacts while preserving natural language
  static String clean(String response) {
    String cleanedResponse = response;
    
    print('🧹 ORIGINAL AI RESPONSE (${response.length} chars):');
    print('📝 FULL RESPONSE: $response');
    
    // AGGRESSIVE APPROACH: Split at first JSON-like character and take only the part before
    final naturalLanguagePart = _extractNaturalLanguageBeforeJson(response);
    if (naturalLanguagePart.isNotEmpty && naturalLanguagePart.length > 20) {
      print('✅ EXTRACTED NATURAL LANGUAGE: $naturalLanguagePart');
      return naturalLanguagePart;
    }
    
    // Fallback: Aggressive cleaning
    // Step 1: Remove everything starting from workout_suggestion
    if (cleanedResponse.contains('workout_suggestion')) {
      final index = cleanedResponse.indexOf('workout_suggestion');
      cleanedResponse = cleanedResponse.substring(0, index).trim();
    }
    
    // Step 2: Remove everything starting from first JSON opening brace after natural text
    final lines = cleanedResponse.split('\n');
    final cleanLines = <String>[];
    
    for (final line in lines) {
      // Stop at any line that looks like JSON
      if (line.trim().startsWith('{') || 
          line.trim().startsWith('"') ||
          line.trim().startsWith('```') ||
          line.contains('workout_suggestion') ||
          RegExp(r'^\s*"[^"]*"\s*:').hasMatch(line)) {
        break;
      }
      cleanLines.add(line);
    }
    
    cleanedResponse = cleanLines.join('\n').trim();
    
    // Step 3: Remove any remaining JSON artifacts
    cleanedResponse = cleanedResponse.replaceAll(RegExp(r'```.*'), '').trim();
    cleanedResponse = cleanedResponse.replaceAll(RegExp(r'\{.*'), '').trim();
    cleanedResponse = cleanedResponse.replaceAll('workout_suggestion', '').trim();
    
    // Step 4: Final cleanup
    cleanedResponse = cleanedResponse.replaceAll(RegExp(r'\n\s*\n\s*\n+'), '\n\n').trim();
    
    print('✅ CLEANED RESPONSE (${cleanedResponse.length} chars): $cleanedResponse');
    
    // If the response is empty or too short after cleaning, provide a fallback
    if (cleanedResponse.isEmpty || cleanedResponse.length < 10) {
      final fallback = 'I\'ve created a custom workout for you! It\'s been added to your schedule. Let me know if you\'d like any adjustments!';
      print('🔄 USING FALLBACK RESPONSE');
      return fallback;
    }
    
    return cleanedResponse;
  }
  
  /// Extract natural language part that appears before any JSON
  static String _extractNaturalLanguageBeforeJson(String response) {
    // Find the first occurrence of JSON-like patterns
    final jsonPatterns = [
      RegExp(r'```'),
      RegExp(r'workout_suggestion'),
      RegExp(r'\{'),
      RegExp(r'^\s*"[^"]*"\s*:', multiLine: true),
    ];
    
    int earliestJsonIndex = response.length;
    
    for (final pattern in jsonPatterns) {
      final match = pattern.firstMatch(response);
      if (match != null && match.start < earliestJsonIndex) {
        earliestJsonIndex = match.start;
      }
    }
    
    if (earliestJsonIndex < response.length) {
      final naturalPart = response.substring(0, earliestJsonIndex).trim();
      // Only return if it's substantial content
      if (naturalPart.length > 20 && !naturalPart.contains('{') && !naturalPart.contains('"name":')) {
        return naturalPart;
      }
    }
    
    return '';
  }
  
  /// Check if a response contains workout suggestion JSON
  static bool containsWorkoutSuggestion(String response) {
    return response.contains('workout_suggestion') || 
           RegExp(r'\{[\s\S]*?"exercises"[\s\S]*?\}').hasMatch(response) ||
           RegExp(r'```[\s\S]*?workout[\s\S]*?```').hasMatch(response);
  }
  
  /// Extract just the natural language part from a mixed response
  static String extractNaturalLanguage(String response) {
    // Find the part before any JSON starts
    final jsonStartPattern = RegExp(r'[\{\[]|```|workout_suggestion');
    final match = jsonStartPattern.firstMatch(response);
    
    if (match != null) {
      final naturalPart = response.substring(0, match.start).trim();
      if (naturalPart.isNotEmpty) {
        return naturalPart;
      }
    }
    
    // If no clear split, use the full cleaning process
    return clean(response);
  }
}