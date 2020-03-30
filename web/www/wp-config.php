<?php
/**
 * Podstawowa konfiguracja WordPressa.
 *
 * Ten plik zawiera konfiguracje: ustawień MySQL-a, prefiksu tabel
 * w bazie danych, tajnych kluczy, używanej lokalizacji WordPressa
 * i ABSPATH. Więćej informacji znajduje się na stronie
 * {@link http://codex.wordpress.org/Editing_wp-config.php Editing
 * wp-config.php} Kodeksu. Ustawienia MySQL-a możesz zdobyć
 * od administratora Twojego serwera.
 *
 * Ten plik jest używany przez skrypt automatycznie tworzący plik
 * wp-config.php podczas instalacji. Nie musisz korzystać z tego
 * skryptu, możesz po prostu skopiować ten plik, nazwać go
 * "wp-config.php" i wprowadzić do niego odpowiednie wartości.
 *
 * @package WordPress
 */

// ** Ustawienia MySQL-a - możesz uzyskać je od administratora Twojego serwera ** //
/** Nazwa bazy danych, której używać ma WordPress */
define('DB_NAME', 'jblew_jblew');

/** Nazwa użytkownika bazy danych MySQL */
define('DB_USER', 'jblew_jblew');

/** Hasło użytkownika bazy danych MySQL */
define('DB_PASSWORD', 'jblew_jblew');

/** Nazwa hosta serwera MySQL */
define('DB_HOST', 'db');

/** Kodowanie bazy danych używane do stworzenia tabel w bazie danych. */
define('DB_CHARSET', 'utf8');

/** Typ porównań w bazie danych. Nie zmieniaj tego ustawienia, jeśli masz jakieś wątpliwości. */
define('DB_COLLATE', '');

/**#@+
 * Unikatowe klucze uwierzytelniania i sole.
 *
 * Zmień każdy klucz tak, aby był inną, unikatową frazą!
 * Możesz wygenerować klucze przy pomocy {@link https://api.wordpress.org/secret-key/1.1/salt/ serwisu generującego tajne klucze witryny WordPress.org}
 * Klucze te mogą zostać zmienione w dowolnej chwili, aby uczynić nieważnymi wszelkie istniejące ciasteczka. Uczynienie tego zmusi wszystkich użytkowników do ponownego zalogowania się.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'O>V&I55^` GC/d$Ax0}@?g4CBl+hf_g5nuTD]N{;L2)caRQN 9TXJsb)V$q=Lr0A');
define('SECURE_AUTH_KEY',  '++e`Q-r f?f^}*ReQgwl0KM|[>?&#xljqm=83._zp3`yLJ$AF=j6aU|v8+Yh<c[o');
define('LOGGED_IN_KEY',    '+_EC(*>A>HDC:/;}57qvcK{AMA.gK9CS|O v0HHhOV5$1.&1/DmhIV&8T-<IRFpk');
define('NONCE_KEY',        '?VXI@M/iFQxcRBvjFeqxZsQb2g.|+@q,aH| 1WOSj/MWc]3-=2U@P/?zK3|R6)?)');
define('AUTH_SALT',        'Qc{$,s&=fiH+&B;8GhH+c-+puq/sRB#E=E~Qq_ZRvmde*pJ#s^A|IZ?huYX**&1w');
define('SECURE_AUTH_SALT', 'S]j+9#;`3T8pWmX/^s|:@=Wp^Mg?i `1!Rbyq0<<^{+|-$=2-1%QRT>?BlTQ)B>0');
define('LOGGED_IN_SALT',   'ug4I|U^1w3*>%p&GEW ,j^#J34U:13eFXhm{jdS&*Ua1>^S9LQ8u%tP)H-#2ZncY');
define('NONCE_SALT',       '51dC$-fH8;Q+oab^W{>,.w9G866MmXI*}xE:TMQOPCd%6b5eTYEwuDTO6}G$}:6u');

/**#@-*/

/**
 * Prefiks tabel WordPressa w bazie danych.
 *
 * Możesz posiadać kilka instalacji WordPressa w jednej bazie danych,
 * jeżeli nadasz każdej z nich unikalny prefiks.
 * Tylko cyfry, litery i znaki podkreślenia, proszę!
 */
$table_prefix  = 'wp_';

/**
 * Kod lokalizacji WordPressa, domyślnie: angielska.
 *
 * Zmień to ustawienie, aby skorzystać z lokalizacji WordPressa.
 * Odpowiedni plik MO z tłumaczeniem na wybrany język musi
 * zostać zainstalowany do katalogu wp-content/languages.
 * Na przykład: zainstaluj plik de.mo do katalogu
 * wp-content/languages i ustaw WPLANG na 'de', aby aktywować
 * obsługę języka niemieckiego.
 */
define ('WPLANG', 'pl_PL');

/**
 * Dla programistów: tryb debugowania WordPressa.
 *
 * Zmień wartość tej stałej na true, aby włączyć wyświetlanie ostrzeżeń
 * podczas modyfikowania kodu WordPressa.
 * Wielce zalecane jest, aby twórcy wtyczek oraz motywów używali
 * WP_DEBUG w miejscach pracy nad nimi.
 */
define('WP_DEBUG', false);

/* To wszystko, zakończ edycję w tym miejscu! Miłego blogowania! */

/** Absolutna ścieżka do katalogu WordPressa. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

define( 'WP_HOME', 'https://jblew.pl' );
define( 'WP_SITEURL', 'https://jblew.pl' );


/** Ustawia zmienne WordPressa i dołączane pliki. */
require_once(ABSPATH . 'wp-settings.php');
