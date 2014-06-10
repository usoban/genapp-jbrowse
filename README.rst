genapp-jbrowse
==============

Setup
------
 - vagrant destroy, use Vagrantfile from ./var, vagrant up  (will setup JBrowse)
 - replace genesis/settings/base.py with ./var/base.py  (with added entry to STATICFILES_DIRS)
 - cd /srv/gendev_web && manage.py collectstatic --ignore=less
 - prepare FASTA sequences with:
     /srv/genome_browser/jbrowse/bin/prepare-refseqs.pl --fasta /srv/gendev_data/{case_id}/{name}.fasta.gz --out /srv/gendev_data/{case_id}/

TODO
------
 - changes to Vagrantfile (copy in ./var/Vagrantfile) need to be commited to genesis
 - changes to base.py (STATIC_DIRS..) (copy in ./var/base.py) need to be commited to genesis
 - custom JBrowse fork
      - building release: requires DateTime.pm (sudo apt-get install libdatetime-perl)
 - add to gencloud/processors/import.yml under import:upload:genome-fasta processor:
       echo -e "\nPostprocessing JBrowse...\n" >&2
      /srv/genome_browser/jbrowse/bin/prepare-refseqs.pl --fasta "${NAME}.fasta.gz" --out .