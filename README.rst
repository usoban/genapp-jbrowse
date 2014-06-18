genapp-jbrowse
==============

Setup
------
 - prepare FASTA sequences with:
     /srv/genome_browser/jbrowse/bin/prepare-refseqs.pl --fasta /srv/gendev_data/{case_id}/{name}.fasta.gz --out /srv/gendev_data/{case_id}/

TODO
------
 - custom JBrowse fork
      - building release: requires DateTime.pm (sudo apt-get install libdatetime-perl)
 - add to gencloud/processors/import.yml under import:upload:genome-fasta processor:
       echo -e "\nPostprocessing JBrowse...\n" >&2
      /srv/genome_browser/jbrowse/bin/prepare-refseqs.pl --fasta "${NAME}.fasta.gz" --out .