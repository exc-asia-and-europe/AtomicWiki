xquery version "3.1";

declare namespace vra="http://www.vraweb.org/vracore4.htm";

import module namespace functx = "http://www.functx.com";
import module namespace image-link-generator="http://atomic.exist-db.org/xquery/atomic/image-link-generator" at "image-link-generator.xqm";

let $image-uuid := request:get-parameter("uuid", "")
let $uri-name := request:get-parameter("size", "tamboti-full")

let $image-vra := collection("/data")//vra:image[@id = $image-uuid][1]

let $image-href := image-link-generator:generate-href($image-uuid, $uri-name)
let $image-filename := functx:substring-after-last($image-vra//vra:image/@href/string(), "/")
let $has-access := sm:has-access(document-uri(root($image-vra)), "r")
(:let $response := httpclient:get($image-href, false(), ()):)
(:let $mime := $response/httpclient:body/@mimetype/string():)

let $image-file-name := $image-vra/@href
let $image-file-collection := util:collection-name($image-vra)
let $image-file-path := $image-file-collection || "/" || $image-file-name
let $image-file-mimetype := xmldb:get-mime-type($image-file-path)

return response:stream-binary(util:binary-doc($image-file-path), $image-file-mimetype, $image-file-name)
    