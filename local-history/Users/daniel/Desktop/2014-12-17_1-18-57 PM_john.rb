#!/usr/bin/ruby -w
require 'rexml/document'
include REXML

Dir.glob("Storage1Test/Views/**/*.xml").each do |f|
 puts f
 srcxml = File.new(f)
 doc = Document.new(srcxml)
 destxml = File.open(f, 'w')

 XPath.each(doc, '//*[text()[contains(.,"\\")]]'){
   |e|
   puts "+Fixed 1 Occurance"
   e.text = e.text.gsub("\\", "\/")
 }
 destxml.puts doc
end
