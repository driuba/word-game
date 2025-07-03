create role "wg-admin" with
	login
	password 'SCRAM-SHA-256$4096:NT2y8Pq2JzxYNCFI7i0SgA==$KcxMV76lSTsWNiSdt98rZ7mUN9OuqhBIpmInBpTHTbM=:7gtBCBHzhQc+xNCHTsQMXj1Sh0W65HKy22Gz8sgVJF0=';
create role "wg-user" with
	login
	password 'SCRAM-SHA-256$4096:SLPJXQDwNrusdPeEUuWpBw==$zW6LDzwC+3B6RkXIclvpCj7g0kKmDB/xqZyEBaGFe9E=:eeCGnfavGpVp4+R+kUImeACvXoXlylsuZyC1F0Q1K58=';

create collation "lt-LT-x-icu-CI" (deterministic = false, locale = 'lt-LT-u-kf-lower-kn-ks-level2', provider = icu);

create database "word-game" with
	encoding = 'UTF8'
	icu_locale = 'lt-LT-x-icu-CI'
	locale_provider = 'icu'
	owner = "wg-admin"
	template = template0;

\connect "word-game" "wg-admin";

create schema "wg" authorization "wg-admin";
alter database "word-game" set search_path to "wg";

drop schema public;
revoke all privileges on database "word-game" from public;

grant connect on database "word-game" to "wg-user" granted by "wg-admin";
grant usage on schema "wg" to "wg-user" granted by "wg-admin";

alter default privileges for role "wg-admin" in schema "wg" grant delete, insert, select, update on tables to "wg-user";
alter default privileges for role "wg-admin" in schema "wg" grant usage on sequences to "wg-user";
