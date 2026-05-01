<?php

class HtmlParser
{
    public static function parse($html)
    {
        $dom = new DOMDocument();
        @$dom->loadHTML($html);
        $xpath = new DOMXPath($dom);

        $sections = [];
        // Identify top-level sections only
        $potentialSections = $xpath->query("//section | //header | //footer | //div[contains(@class, 'section')] | //div[contains(@id, 'section')]");

        foreach ($potentialSections as $node) {
            // Check if this node is inside another section already in our list
            if (self::isInsideAnotherSection($node)) continue;

            $fields = [];
            self::analyzeNode($node, $fields);
            
            if (!empty($fields)) {
                $id = $node->getAttribute('id');
                $class = $node->getAttribute('class');
                $name = $id ?: self::getFirstClass($class) ?: $node->nodeName;
                $slug = strtolower(preg_replace('/[^a-zA-Z0-9]/', '_', $name));

                $sections[] = [
                    'name' => ucwords(str_replace('_', ' ', $slug)),
                    'slug' => $slug,
                    'fields' => $fields
                ];
            }
        }

        return $sections;
    }

    private static function isInsideAnotherSection($node)
    {
        $parent = $node->parentNode;
        while ($parent && $parent->nodeType === XML_ELEMENT_NODE) {
            $tag = strtolower($parent->nodeName);
            $class = strtolower($parent->getAttribute('class'));
            if ($tag === 'section' || strpos($class, 'section') !== false || $tag === 'header' || $tag === 'footer') {
                return true;
            }
            $parent = $parent->parentNode;
        }
        return false;
    }

    private static function analyzeNode($node, &$fields, $depth = 0)
    {
        if ($node->nodeType !== XML_ELEMENT_NODE) return;

        // STOP if we hit another section boundary while analyzing fields
        $tag = strtolower($node->nodeName);
        $class = strtolower($node->getAttribute('class'));
        if ($depth > 0 && ($tag === 'section' || strpos($class, 'section') !== false || $tag === 'header' || $tag === 'footer')) {
            return;
        }

        $text = trim($node->nodeValue);
        $nameAttr = strtolower($node->getAttribute('name'));

        $type = null;
        $label = "";

        // Detection Logic
        if ($tag === 'img') {
            $type = 'image';
            $label = 'Image';
        } elseif ($tag === 'i' || strpos($class, 'icon') !== false) {
            $type = 'icon';
            $label = 'Icon';
        } elseif ($tag === 'button' || ($tag === 'a' && strpos($class, 'btn') !== false)) {
            $type = 'button';
            $label = 'Button';
        } elseif ($tag === 'a' && !empty($text)) {
            $type = 'link';
            $label = 'Link';
        } elseif ($tag === 'h1' || $tag === 'h2') {
            $type = 'heading';
            $label = 'Heading';
        } elseif ($tag === 'h3' || $tag === 'h4' || $tag === 'h5' || $tag === 'h6') {
            $type = 'subheading';
            $label = 'Sub Heading';
        } elseif ($tag === 'p' && strlen($text) > 100) {
            $type = 'paragraph';
            $label = 'Paragraph';
        } elseif ($tag === 'select') {
            $type = 'select';
            $label = 'Dropdown';
        } elseif (strpos($class, 'contact') !== false || strpos($nameAttr, 'email') !== false || strpos($nameAttr, 'phone') !== false) {
            $type = 'contact';
            $label = 'Contact Info';
        } elseif ($tag === 'textarea' || strpos($class, 'box') !== false) {
            $type = 'textbox';
            $label = 'Text Box';
        } elseif (($tag === 'input' || (strlen($text) > 0 && strlen($text) < 100)) && !in_array($tag, ['script', 'style', 'nav'])) {
            // Check if it has child elements. If it does, it's a container, not a text field
            if (!$node->hasChildNodes() || ($node->childNodes->length === 1 && $node->firstChild->nodeType === XML_TEXT_NODE)) {
                $type = 'text';
                $label = 'Text Input';
            }
        }

        if ($type && !empty($text) && strlen($text) < 200) {
            $fieldName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '_', $text));
            if (empty($fieldName)) $fieldName = "field_" . count($fields);
            
            $exists = false;
            foreach ($fields as $f) {
                if ($f['name'] === $fieldName) { $exists = true; break; }
            }

            if (!$exists) {
                $fields[] = [
                    'name' => $fieldName,
                    'type' => $type,
                    'label' => $label
                ];
            }
        }

        foreach ($node->childNodes as $child) {
            self::analyzeNode($child, $fields, $depth + 1);
        }
    }

    private static function getFirstClass($class)
    {
        if (!$class) return null;
        $parts = explode(' ', $class);
        return $parts[0];
    }
}
