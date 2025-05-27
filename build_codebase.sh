#!/bin/bash

# Répertoire cible (par défaut = répertoire courant)
TARGET_DIR=${1:-.}

# Fichier de sortie
OUTPUT_FILE="codebase.txt"

# Nettoyage du fichier de sortie précédent s'il existe
> "$OUTPUT_FILE"

# Recherche récursive et traitement des fichiers
find "$TARGET_DIR" -type f \( -iname "*.js" -o -iname "*.css" -o -iname "*.html" \) | while read -r FILE; do
    echo "### FILE: $FILE" >> "$OUTPUT_FILE"
    cat "$FILE" >> "$OUTPUT_FILE"
    echo -e "\n\n" >> "$OUTPUT_FILE"
done

echo "✅ Tous les fichiers concaténés dans $OUTPUT_FILE"
