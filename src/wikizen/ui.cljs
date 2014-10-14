(ns wikizen.ui
  (:require-macros [hiccups.core :as hiccups])
  (:require [hiccups.runtime :as hiccupsrt]
            [wikizen.template-engine :as te]
            [goog.dom :as dom]
            [goog.events :as events]))

(defn- create-link
  [text event params]
  [:a {:href "#"
       :data-event event
       :data-params (.stringify js/JSON (clj->js params))} text])

(defn
  edit-page
  "Generates a page with a text area and a preview for
  editing and creation of pages"
  [location mode]
  (te/template->dom
    [:input#title.full-width.input-fields {:type "text"
                                           :style {:font-weight "bold"}
                                           :placeholder "Page name"}]
    [:textarea#body.full-width.input-fields {:rows 30}]
    [:br]
    [:a {:href "#" :onclick (fn [e] (js/alert "hi there"))} "save"]))

(hiccups/defhtml
  page
  "Generates a wiki page; location is an index vector of the current page,
  title-path is a vector of [index title] pairs till the current page,
  wiki is the node of current wiki"
  [location title-path wiki]
  [:div#headbar {:style "display: flex; display: -webkit-flex;"}
   [:code {:style "flex: 2 1 0; -webkit-flex: 2 1 0;"}
    (interpose " / "
               (conj
                 (into [] (map
                            #(create-link (second %)
                                          "load-page"
                                          (first %))
                            (butlast title-path)))
                 (second (last title-path))))]
   [:code (interpose " &middot; "
                     (map #(create-link % (str % "-page")
                                        {:location location
                                         :mode %})
                          ["new" "edit" "delete"]))]]
  [:h1 (wiki :title)]
  [:article#markdown (.marked js/window (wiki :body))]
  (when-let [children (wiki :children)]
    [:div
     [:hr]
     [:h3 "Nested Pages"]
     [:ul
      (map
        #(let [[i child] %]
          (vector :li
                  (create-link (child :title)
                               "load-page"
                               (concat location [i]))))
        (map list (range) children))]]))
